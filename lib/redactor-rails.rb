require 'orm_adapter'
require 'redactor-rails/version'

module RedactorRails
  IMAGE_TYPES = %w(image/jpeg image/png image/gif image/jpg image/pjpeg image/tiff image/x-png)

  FILE_TYPES = %w(application/msword application/pdf text/plain text/rtf application/vnd.ms-excel)

  autoload :Http, 'redactor-rails/http'
  autoload :Devise, 'redactor-rails/devise'

  module Backend
    autoload :CarrierWave, 'redactor-rails/backend/carrierwave'
  end

  require 'redactor-rails/orm/base'
  require 'redactor-rails/orm/active_record'
  require 'redactor-rails/orm/mongoid'
  require 'redactor-rails/engine'
  require 'redactor-rails/helper'

  mattr_accessor :image_file_types
  @@image_file_types = %w(jpg jpeg png gif tiff)

  mattr_accessor :attachment_file_types
  @@attachment_file_types = %w(doc docx xls odt ods pdf rar zip tar tar.gz swf)

  @@picture_model = nil
  @@attachment_file_model = nil

  def self.picture_model(&block)
    if block_given?
      self.picture_model = block
    else
      @@picture_model_class ||= begin
        if @@picture_model.respond_to? :call
          @@picture_model.call
        else
          @@picture_model || RedactorRails::Picture
        end
      end
    end
  end

  def self.picture_model=(value)
    @@picture_model_class = nil
    @@picture_model = value
  end

  def self.picture_adapter
    picture_model.to_adapter
  end

  def self.attachment_file_model(&block)
    if block_given?
      self.attachment_file_model = block
    else
      @@attachment_file_model_class ||= begin
        if @@attachment_file_model.respond_to? :call
          @@attachment_file_model.call
        else
          @@attachment_file_model || RedactorRails::AttachmentFile
        end
      end
    end
  end

  def self.attachment_file_model=(value)
    @@attachment_file_model_class = nil
    @@attachment_file_model = value
  end

  def self.attachment_file_adapter
    attachment_file_model.to_adapter
  end

  def self.devise_user
    %s(user)
  end

  def self.devise_user_key
    "#{devise_user}_id".to_sym
  end

  def self.setup
    yield self
  end
end
