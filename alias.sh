#!/bin/bash
# Git Flow helper aliases
# Source this file: source ./alias.sh

alias gf='git flow'
alias gff='git flow feature'
alias gffstart='git flow feature start'
alias gfffinish='git flow feature finish'
alias gffp='git flow feature publish'
alias gfp='git flow feature pull'

alias gfh='git flow hotfix'
alias gfhstart='git flow hotfix start'
alias gfhfinish='git flow hotfix finish'

alias gfr='git flow release'
alias gfrstart='git flow release start'
alias gfrfinish='git flow release finish'

alias gfs='git flow feature status'
alias gfl='git flow log'

echo "Git Flow aliases loaded. Use: gf, gff, gffstart, gfffinish, gfh, gfr"
