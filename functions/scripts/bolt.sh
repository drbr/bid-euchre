#/usr/bin/env zsh

script_dir=${0:h}

# Paths are relative to the `functions` directory
schemaFile="../databaseSchema.bolt"

databaseRulesJsonOutput="../database.rules.json"

# Clean up the old files to be extra sure
rm "$databaseRulesJsonOutput" 2>/dev/null


# Compile the JSON database rules schema
firebase-bolt < "$schemaFile" > "$databaseRulesJsonOutput"
