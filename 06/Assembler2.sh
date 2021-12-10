#!/usr/bin/env bash
":" //# comment; exec /usr/bin/env node --input-type=module - "$@" < "$0"

import { Hello } from './Assembler/index.mjs'

Hello();