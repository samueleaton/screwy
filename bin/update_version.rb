#!/usr/bin/env ruby
require 'json'
package_json_path = File.expand_path("../package.json", __dir__)
package_json = JSON.parse(File.read package_json_path)
version = package_json["version"]

major, minor, patch = version.split(".").map!(&:to_i)

inc_major = -> {"#{major + 1}.0.0"}
inc_minor = -> {"#{major}.#{minor + 1}.0"}
inc_patch = -> {"#{major}.#{minor}.#{patch + 1}"}

get_increment_type = -> {
  puts "current version: #{version}"
  print "(major), (minor), or (patch)? "
  user_input = gets.chomp
  unless (user_input =~ /^\s*(major|minor|patch)\s*$/i)
    puts "Bad input. Aborting..."
    exit(1)
  end
  user_input
}

get_new_version = -> (inc_type) {
  if inc_type =~ /^\s*major\s*$/i
    inc_major.()
  elsif inc_type =~ /^\s*minor\s*$/i
    inc_minor.()
  elsif inc_type =~ /^\s*patch\s*$/i
    inc_patch.()
  end
}

confirm_version = -> (new_version) {
  print "#{new_version} is ok? Y/(n) "
  confirm = gets.chomp
  unless (confirm =~ /^Y(es)?$/i)
    puts "Not confirmed. Aborting..."
    exit(1)
  end
}


inc_type = get_increment_type.()
new_version = get_new_version.(inc_type)
confirm_version.(new_version)

package_json["version"] = new_version
File.write(package_json_path, JSON.pretty_generate(package_json))

puts "project updated to version #{new_version}"
