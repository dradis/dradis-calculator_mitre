module Dradis::Plugins::Calculators::MITRE
  class IssuesController < ::IssuesController
    before_action only: :edit

    skip_before_action :remove_unused_state_param

    def edit
      @issue_fields = Dradis::Plugins::Calculators::MITRE::V1::FIELDS.map do |field|
        value = @issue.fields[field]
        value = 'N/A' if value.blank?
        "#[#{field}]#\n#{value}"
      end.join("\n\n")
    end

    def update
      raw = params[:mitre_fields].to_s
      mitre_fields = Hash[*raw.scan(FieldParser::FIELDS_REGEX).flatten.map(&:strip)]

      mitre_fields.each do |name, value|
        @issue.set_field(name, value)
      end

      if @issue.save
        redirect_to main_app.project_issue_path(current_project, @issue), notice: 'MITRE fields updated.'
      else
        render :edit
      end
    end
  end
end
