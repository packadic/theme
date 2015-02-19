# Packadic theme  
**Currently in development**. By Robin Radic. [MIT Licensed](LICENSE)  
  
This is a admin theme that i intend to use for a lot of projects.
The theme utilizes RequireJS to lazy-load load javascript files.
It can automaticly detect if a certain script is required.
  
I created the site using SCSS as style pre-processor and Jade as HTML pre-processor.
The plan is to eventually start using Typescript as Javascript pre-processor, but i'll
start implementing that further down the road.
  
The theme is MIT licensed, so you can basically do with it whatever you want.
In the near future there'll be some examples here showing several methods on how to implement
this theme into different projects like Laravel blade, Github pages/jekyll etc.
  
  
  
## Information
- [Changelog](CHANGELOG.md)
- [Grunt task overview](TASKS.md)
- [Roadmap](ROADMAP.md)  
- [MIT Licensed](LICENSE)  


## Build requirements
- nodejs / npm / bower / grunt-cli  
- ruby / rubygems / bundler  


## Install
```bash
# ensure nodejs, ruby, git etc are installed. also npm, bower, grunt, bundle, rubygems
git clone https://github.com/packadic/theme
cd theme
npm install
bower install
bundle install
```
`sdfa`



## 3d part dos
http://vast-engineering.github.io/jquery-popup-overlay/
bourbon scss -

## Comes with:
- src: source files(jade, scss, etc)
- dist: Processed (minified css,js,html and imge, concatd, build *htm, ss)
- test: test files

### Build with:
- Grunt (With a whole lot of contributions and self writtent tsks)
- Bower
- Node (no server side/http) code. just processing
- SCSS (bootstrap, google material colors)
- lodash
- Jade
- preprocess
- RequireJS
