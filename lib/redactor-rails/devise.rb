module RedactorRails
  # Devise
  module Devise
    def redactor_current_user
      instance_eval(&RedactorRails.current_user_method)
    end

    def devise_user_condition
      if RedactorRails.picture_model.new.respond_to?(RedactorRails.devise_user)
        { RedactorRails.devise_user_key => redactor_current_user.id }
      else
        {}
      end
    end
  end
end
