#!/bin/bash
node scripts/i18n_build.js
node scripts/client_i18n_build.js
pm2 start pm2.json