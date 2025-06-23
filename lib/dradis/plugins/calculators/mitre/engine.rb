module Dradis::Plugins::Calculators::MITRE
  class Engine < ::Rails::Engine
    isolate_namespace Dradis::Plugins::Calculators::MITRE

    include Dradis::Plugins::Base
    provides :addon
    description 'Risk Calculators: MITRE'

    initializer 'calculator_mitre.asset_precompile_paths' do |app|
      app.config.assets.precompile += [
        'dradis/plugins/calculators/mitre/base.css',
        'dradis/plugins/calculators/mitre/base.js',
        'dradis/plugins/calculators/mitre/manifests/hera.css',
        'dradis/plugins/calculators/mitre/manifests/hera.js'
      ]
    end

    initializer "calculator_mitre.inflections" do |app|
      ActiveSupport::Inflector.inflections do |inflect|
        inflect.acronym('MITRE')
      end
    end

    initializer 'calculator_mitre.mount_engine' do
        Rails.application.routes.append do
          # Enabling/disabling integrations calls Rails.application.reload_routes! we need the enable
          # check inside the block to ensure the routes can be re-enabled without a server restart
          if Engine.enabled?
            mount Engine => '/', as: :mitre_calculator
          end
        end
      # end
    end
  end
end
