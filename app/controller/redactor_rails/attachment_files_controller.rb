module RedactorRails
  # Attachment Files Controller
  class AttachmentFilesController < ApplicationController
    before_filter :redactor_authenticate_user!

    def index
      attachment_model = RedactorRails.attachment_file_model
      @attachments = attachment_model.where(devise_user_condition)
      render json: @attachments.to_json
    end

    def create
      @attachment = RedactorRails.attachment_file_model.new

      file = params[:file]
      @attachment.data = RedactorRails::Http.normalize_param(file, request)
      if @attachment.has_attribute?(:"#{RedactorRails.devise_user_key}")
        @attachment.send("#{RedactorRails.devise_user}=", redactor_current_user)
        @attachment.assetable = redactor_current_user
      end

      if @attachment.save
        render json: {
          filelink: @attachment.url, filename: @attachment.filename
        }
      else
        render json: { error: @attachment.errors }
      end
    end

    private

    def redactor_authenticate_user!
      attachment_file_model = RedactorRails.attachment_file_model.new
      super if attachment_file_model.has_attribute?(RedactorRails.devise_user)
      nil
    end
  end
end
