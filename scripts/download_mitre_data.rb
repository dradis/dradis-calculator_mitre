require 'json'
require 'net/http'
require 'uri'

puts "Starting MITRE data preprocessing..."

DOMAINS = {
  enterprise: 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json',
  mobile:     'https://raw.githubusercontent.com/mitre/cti/master/mobile-attack/mobile-attack.json',
  ics:        'https://raw.githubusercontent.com/mitre/cti/master/ics-attack/ics-attack.json'
}

OUTPUT_PATH = 'app/assets/javascripts/dradis/plugins/calculators/mitre/data/mitre_data.json'

def fetch_json(url)
  uri = URI.parse(url)
  response = Net::HTTP.get_response(uri)
  JSON.parse(response.body)
end

def extract_domain_data(json)
  objects = json['objects']
  tactics = objects.select { |o| o['type'] == 'x-mitre-tactic' && !o['revoked'] }

  tactic_data = tactics.map do |tactic|
    tactic_id = tactic.dig('external_references', 0, 'external_id')
    next unless tactic_id

    related_techniques = objects.select do |obj|
      obj['type'] == 'attack-pattern' &&
      obj['kill_chain_phases']&.any? { |phase| phase['phase_name'] == tactic['x_mitre_shortname'] } &&
      !obj['revoked'] &&
      !obj['x_mitre_is_subtechnique']
    end

    techniques = related_techniques.map do |technique|
      tech_id = technique.dig('external_references', 0, 'external_id')
      next unless tech_id

      subtechniques = objects.select do |sub|
        sub['type'] == 'attack-pattern' &&
        sub['x_mitre_is_subtechnique'] &&
        sub['revoked'] != true &&
        sub.dig('external_references', 0, 'external_id')&.start_with?("#{tech_id}.")
      end.map do |sub|
        {
          id: sub.dig('external_references', 0, 'external_id'),
          name: sub['name']
        }
      end

      subtechniques.sort_by! { |s| s[:name].downcase }

      {
        id: tech_id,
        name: technique['name'],
        subtechniques: subtechniques
      }
    end.compact

    techniques.sort_by! { |t| t[:name].downcase }

    {
      id: tactic_id,
      name: tactic['name'],
      techniques: techniques
    }
  end.compact

  tactic_data.sort_by! { |t| t[:name].downcase }
end

combined_data = {}

DOMAINS.each do |domain, url|
  puts "Processing #{domain.capitalize}..."
  json = fetch_json(url)
  puts "Downloading: #{url}"

  combined_data[domain] = { tactics: extract_domain_data(json) }
end

File.open(OUTPUT_PATH, 'w') do |f|
  f.write(JSON.pretty_generate(combined_data))
end

puts "JSON saved to #{OUTPUT_PATH}"
