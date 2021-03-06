/*
 Copyright (c) 2012, Oracle and/or its affiliates. All rights
 reserved.
 
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; version 2 of
 the License.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 02110-1301  USA
 */

'use strict';

var nosql = require('..');
var lib = require('./lib.js');
var adapter = 'ndb';
global.mysql_conn_properties = {};

var user_args = [];
// *** program starts here ***

// analyze command line

var usageMessage = 
  "Usage: node insert author message\n" +
  "          -h or --help: print this message\n" +
  "         -d or --debug: set the debug flag\n" +
  "  --mysql_socket=value: set the mysql socket\n" +
  "    --mysql_port=value: set the mysql port\n" +
  "    --mysql_host=value: set the mysql host\n" +
  "    --mysql_user=value: set the mysql user\n" +
  "--mysql_password=value: set the mysql password\n" +
  "              --detail: set the detail debug flag\n" +
  "   --adapter=<adapter>: run on the named adapter (e.g. ndb or mysql)\n"
  ;

// handle command line arguments
var i, exit, val, values;

for(i = 2; i < process.argv.length ; i++) {
  val = process.argv[i];
  switch (val) {
  case '--debug':
  case '-d':
    unified_debug.on();
    unified_debug.level_debug();
    break;
  case '--detail':
    unified_debug.on();
    unified_debug.level_detail();
    break;
  case '--help':
  case '-h':
    exit = true;
    break;
  default:
    values = val.split('=');
    if (values.length === 2) {
      switch (values[0]) {
      case '--adapter':
        adapter = values[1];
        break;
      case '--mysql_socket':
        mysql_conn_properties.mysql_socket = values[1];
        break;
      case '--mysql_port':
        mysql_conn_properties.mysql_port = values[1];
        break;
      case '--mysql_host':
        mysql_conn_properties.mysql_host = values[1];
        break;
      case '--mysql_user':
        mysql_conn_properties.mysql_user = values[1];
        break;
      case '--mysql_password':
        mysql_conn_properties.mysql_password = values[1];
        break;
      default:
        console.log('Invalid option ' + val);
        exit = true;
      }
    } else {
      user_args.push(val);
   }
  }
}

if (user_args.length !== 2) {
  console.log(usageMessage);
  process.exit(0);
};

if (exit) {
  console.log(usageMessage);
  process.exit(0);
}

console.log('Running insert with adapter', adapter, user_args);
//create a database properties object

var dbProperties = new nosql.ConnectionProperties(adapter);

// create a basic mapping
var annotations = new nosql.TableMapping('tweet').applyToClass(lib.Tweet);

//check results of insert
var onInsert = function(err, object) {
  console.log('onInsert.');
  if (err) {
    console.log(err);
  } else {
    console.log('Inserted: ' + JSON.stringify(object));
  }
  process.exit(0);
};

// insert an object
var onSession = function(err, session) {
  if (err) {
    console.log('Error onSession.');
    console.log(err);
    process.exit(0);
  } else {
    var data = new lib.Tweet(user_args[0], user_args[1]);
    session.persist(data, onInsert, data);
  }
};

// connect to the database
nosql.openSession(dbProperties, lib.Tweet, onSession);

