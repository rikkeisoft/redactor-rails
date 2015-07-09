class RedactorRails::AttachmentFilesController < ApplicationController
  before_filter :redactor_authenticate_user!

  def index
    @attachments = RedactorRails.attachment_file_model.where(
        RedactorRails.attachment_file_model.new.respond_to?(RedactorRails.devise_user) ? { RedactorRails.devise_user_key => redactor_current_user.id } : { })
    render :json => @attachments.to_json
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
      render json: { filelink: @attachment.url, filename: @attachment.filename }
    else
      render json: { error: @attachment.errors }
    end
  end

  private

  def redactor_authenticate_user!
    if RedactorRails.attachment_file_model.new.has_attribute?(RedactorRails.devise_user)
      super
    end
  end
end
