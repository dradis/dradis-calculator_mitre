module Dradis::Plugins::Calculators::MITRE
  class V1
    FIELD_NAMES = %i[
      Enterprise.Tactic
      Enterprise.Tactic.ID
      Enterprise.Technique
      Enterprise.Technique.ID
      Enterprise.Sub-technique
      Enterprise.Sub-technique.ID
      Mobile.Tactic
      Mobile.Tactic.ID
      Mobile.Technique
      Mobile.Technique.ID
      Mobile.Sub-technique
      Mobile.Sub-technique.ID
      ICS.Tactic
      ICS.Tactic.ID
      ICS.Technique
      ICS.Technique.ID
      ICS.Sub-technique
      ICS.Sub-technique.ID
    ].freeze

    FIELDS = FIELD_NAMES.map { |name| "MITRE.#{name}".freeze }.freeze
  end
end
