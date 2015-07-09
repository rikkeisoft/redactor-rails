# encoding: utf-8
class RedactorRailsAttachmentFileUploader < CarrierWave::Uploader::Base
  include RedactorRails::Backend::CarrierWave

  # storage :fog
  storage :file

  def store_dir
    "system/redactor_assets/attachment_file/#{model.id}"
  end

  def extension_white_list
    RedactorRails.attachment_file_types
  end
end
