require 'rails/generators'
require 'rails/generators/migration'

module Redactor
  module Generators
    # Install Generator
    class InstallGenerator < ::Rails::Generators::Base
      include ::Rails::Generators::Migration
      desc 'Generates migration for Tag and Tagging models'

      class_option :orm, type: :string, default: 'active_record',
        desc: 'Backend processor for upload support'

      class_option :backend, type: :string, default: 'carrierwave',
        desc: 'carrierwave(default)'

      def self.source_root
        @source_root ||= File.expand_path(
          File.join(File.dirname(__FILE__), 'templates'))
      end

      def self.next_migration_number(_)
        Time.now.strftime('%Y%m%d%H%M%S')
      end

      def mount_engine
        route "mount RedactorRails::Engine => '/redactor_rails'"
      end

      def create_models
        [:asset, :picture, :attachment_file].each do
          template "#{generator_dir}/redactor/#{filename}.rb",
            File.join('app/models', redactor_dir, "#{filename}.rb")
        end

        if 'carrierwave' == backend
          filename = "redactor_rails_#{filename}_uploader.rb"
          [:picture, :attachment_file].each do
            template "#{uploaders_dir}/uploaders/#{filename}",
              File.join('app/uploaders', filename)
          end
        end
        nil
      end

      def create_redactor_migration
        if 'active_record' == orm.to_s
          if ARGV.include?('--devise')
            migration_template '#{generator_dir}/devise_migration.rb',
              File.join('db/migrate', 'create_redactor_assets.rb')
          else
            migration_template '#{generator_dir}/migration.rb',
              File.join('db/migrate', 'create_redactor_assets.rb')
          end
        end
        nil
      end

      protected

      def redactor_dir
        'redactor_rails'
      end

      def generator_dir
        @generator_dir ||= [orm, backend].join('/')
      end

      def uploaders_dir
        @uploaders_dir ||= %w(base carrierwave).join('/')
      end

      def orm
        options[:orm] || 'active_record'
      end

      def backend
        options[:backend] || 'carrierwave'
      end
    end
  end
end
