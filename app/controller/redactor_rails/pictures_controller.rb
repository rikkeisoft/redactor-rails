module RedactorRails
  # Pictures Controller
  class PicturesController < ApplicationController
    before_action :redactor_authenticate_user!

    def index
      @pictures = RedactorRails.picture_model.where(devise_user_condition)
      render json: @pictures.to_json
    end

    def create
      @picture = RedactorRails.picture_model.new

      file = params[:file]
      @picture.data = RedactorRails::Http.normalize_param(file, request)
      if @picture.has_attribute?(:"#{RedactorRails.devise_user_key}")
        @picture.send("#{RedactorRails.devise_user}=", redactor_current_user)
        @picture.assetable = redactor_current_user
      end

      if @picture.save
        render json: { filelink: @picture.url }
      else
        render json: { error: @picture.errors }
      end
    end

    private

    def redactor_authenticate_user!
      picture_model = RedactorRails.picture_model.new
      super if picture_model.has_attribute?(RedactorRails.devise_user)
      nil
    end
  end
end
