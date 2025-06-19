module Dradis::Plugins::Calculators::MITRE
  class BaseController < ActionController::Base
    def index
      @issue_fields = Dradis::Plugins::Calculators::MITRE::V1::FIELDS.map do |field|
        "#[#{field}]#\nN/A"
      end.join("\n\n")
    end
  end
end
