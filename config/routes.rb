Dradis::Plugins::Calculators::MITRE::Engine.routes.draw do
  resources :projects, only: [] do
    resources :issues, only: [] do
      member do
        get 'mitre' => 'issues#edit'
        patch 'mitre' => 'issues#update'
      end
    end
  end
end
