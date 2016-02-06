#!/usr/bin/env ruby

#
# file is ran on `npm publish` as the prepublish script
#

def die
  puts "\e[31m\nErrors! Aborting publish...\e[0m"
  exit(1)
end

# stylesheets
loop do
  print "\nDo you want to compile stylesheets?(Y)/n "
  response = gets.strip
  response = "Y" if response.empty?

  break if response =~ /^no?$/i 
  next if response !~ /^y(es)?$/i

  die unless system "npm run stylus"
  die unless system "npm run stylus-themes"

  break
end

# scripts
loop do
  print "\nDo you want to transpile scripts?(Y)/n "
  response = gets.strip
  response = "Y" if response.empty?

  break if response =~ /^no?$/i 
  next if response !~ /^y(es)?$/i

  die unless system "npm run transpile-index"
  die unless system "npm run transpile-scripts"
  die unless system "npm run transpile-cli"
  die unless system "npm run transpile-postinstall"

  break
end

# tests
loop do
  print "\nDo you want to run tests?(Y)/n "
  response = gets.strip
  response = "Y" if response.empty?

  break if response =~ /^no?$/i 
  next if response !~ /^y(es)?$/i
  
  die unless system "npm run test"

  break
end

# versioning
loop do
  print "\nDo you want to update version?(Y)/n "
  response = gets.strip
  response = "Y" if response.empty?

  break if response =~ /^no?$/i 
  next if response !~ /^y(es)?$/i
  
  die unless system "npm run update-version"

  break
end

puts "All successful. Ready to Publish."
