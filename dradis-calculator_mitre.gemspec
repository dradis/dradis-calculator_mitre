$:.push File.expand_path('../lib', __FILE__)

require 'dradis/plugins/calculators/mitre/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.platform = Gem::Platform::RUBY
  spec.name = 'dradis-calculator_mitre'
  spec.version = Dradis::Plugins::Calculators::MITRE::VERSION::STRING
  spec.summary = 'This plugin adds a MITRE addon to Dradis.'
  spec.description = 'Add MITRE tactics, techniques, and sub-techniques to your Issues.'

  spec.license = 'GPL-2'

  spec.authors = ['Dradis Team']
  spec.homepage = 'https://dradis.com/support/guides/projects/calculators.html'

  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    Dir["{app,config,db,lib}/**/*", 'CHANGELOG.md', 'LICENSE', 'Rakefile', 'README.md']
  end
  spec.executables = spec.files.grep(%r{^bin/}).map { |f| File.basename(f) }
  spec.test_files = spec.files.grep(%r{^(test|spec|features)/})

  # By not including Rails as a dependency, we can use the gem with different
  # versions of Rails (a sure recipe for disaster, I'm sure), which is needed
  # until we bump Dradis Pro to 4.1.
  # s.add_dependency 'rails', '~> 4.1.1'
  spec.add_dependency 'dradis-plugins', '~> 4.0'

  spec.add_development_dependency 'bundler', '~> 2.0'
  spec.add_development_dependency 'rake', '~> 10.0'
end
