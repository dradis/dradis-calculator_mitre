module Dradis::Plugins::Calculators::MITRE
  class V1
    FIELD_NAMES = %i[
      tactics
      technique
      sub-technique
    ].freeze

    FIELDS = FIELD_NAMES.map { |name| "MITRE.#{name}".freeze }.freeze
  end
end
