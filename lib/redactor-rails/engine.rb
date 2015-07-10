module RedactorRails
  # Extends Rails Engine
  class Engine < Rails::Engine
    isolate_namespace RedactorRails
    initializer 'helper' do
      ActiveSupport.on_load(:action_view) do
        include RedactorRails::Helpers
      end
    end

    initializer 'redactor_devise' do
      ActionController::Base.send :include, RedactorRails::Devise
    end
  end
end
