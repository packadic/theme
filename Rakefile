desc 'Convert less to sass'
task :convert, [:from] do |t, args|
  require './rb/tasks/converter'

  Converter.new().process_style(args.from)
end