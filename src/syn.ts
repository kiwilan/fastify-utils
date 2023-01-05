#! /usr/bin/env node

import { program } from 'commander'
import list from './commands/list'

program
  .command('list')
  .description('List all the TODO tasks')
  .action(list)

program.parse()
