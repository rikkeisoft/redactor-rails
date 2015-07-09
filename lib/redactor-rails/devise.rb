module RedactorRails
  module Devise
    def redactor_current_user
      instance_eval &RedactorRails.current_user_method
    end
  end
end
