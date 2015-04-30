require 'compass/import-once/activate'
require 'SassyJSON'
require 'sassy-math'
require 'chroma'

# Set this to the root of your project when deployed:
relative_assets = true
http_path = ""
css_dir = "dev/assets/styles"
sass_dir = "src/styles"
images_dir = "dev/assets/images"
javascripts_dir = "src/scripts"

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed

# To enable relative paths to assets via compass helper functions. Uncomment:

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false

sourcemap = false
# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass
