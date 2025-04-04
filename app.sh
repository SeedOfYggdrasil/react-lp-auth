#!/bin/bash

export approot=$appsdir/noted

app_vars() {
    export client=$approot/client
    export clientsrc=$client/src
    export clientappfile=$clientsrc/App.jsx
    export clientmainfile=$clientsrc/main.jsx
    export clientconfig=$client/vite.config.js
    export clientenv=$client/.env
    export clientcomps=$clientsrc/components
    export clientpages=$clientsrc/pages
    export clientstyles=$clientsrc/css
    export clientassets=$clientsrc/assets
    export appserver=$approot/server
    export serverenv=$appserver/.env
    export serverfile=$appserver/server.js
}

app_deploy() {
    clear
    cd $approot
    if ! command -v nvm; then
        echo -e "${bold_red}Error${nc}: Node Version Manager is not installed." && exit 1 &>/dev/null
    fi
    if [ ! -d "$server/node_modules" ] || [ ! -d "$client/node_modules" ]; then
        npm run init && npm run deploy
    else
        npm run deploy
    fi
}

app_reset() {
    rm -rf $appserver/node_modules $appserver/package-lock.json $client/node_modules $client/package-lock.json
}

app_sync() {
    local b="$(git branch | grep '\*' | cut -d ' ' -f2)"
    cd $approot
    git add .
    git commit -m "General Updates"
    git push origin "$b"
}

app_help() {
        echo
        echo "  Usage: app [option] [file]"
        echo
        echo "  Examples:"
        echo "    app c | Naviagtes to the client directory."
        echo "    app page LP | Opens 'LandingPage.jsx' in a text editor (nano by default)."
        echo
        echo "  Options:"
        echo "    app             Navigate to the app root directory."
        echo "    s               Navigate to the server directory."
        echo "    ss              Edit server/server.js."
        echo "    se              Edit server/.env."
        echo "    c               Navigate to the client directory."
        echo "    cs              Navigate to the client/src directory."
        echo "    cc              Navigate to the client/src/components directory."
        echo "    cp              Navigate to the client/src/pages directory."
        echo "    ca              Navigate to the client/src/assets directory."
        echo "    cs              Navigate to the client/src/css directory."
        echo "    client [file]   Edit client/[file]."
        echo "    src [file]      Edit client/src/[file]."
        echo "    page [file]     Edit client/src/pages/[file]."
        echo "    comp [file]     Edit client/src/components/[file]."
        echo "    style [file]    Edit client/src/css/[file]."
        echo "    deploy          Build and deploy the app."
        echo "    reset           Reset and deploy the app."
        echo "    sync            Synchronize the app with remote branch."
        echo "    -h|--help       Display this help dialogue."
        echo
        return 0
}

app() {
    local input=${1:-"app"}
    local file=$2

    if [ -z "$approot" ]; then
        read -p "App root directory path: " approot
        export approot
        app_vars
    fi

    case $input in
       -h|h|--help|help) app_help ;;
       "app") cd $approot ;;
         "s") cd $appserver  ;;
        "ss") nano $serverfile ;;
        "se") nano $serverenv ;;
         "c") cd $client ;;
        "cs") cd $clientsrc ;;
        "cc") cd $clientcomps ;;
        "cp") cd $clientpages ;;
        "ca") cd $clientassets ;;
        "cs") cd $clientstyles ;;
    "client") nano $client/$file ;;
       "src") nano $clientsrc/$file ;;
      "page") nano $clientpages/$file ;;
      "comp") nano $clientcomps/$file ;;
     "style") nano $clientstyles/$file ;;
    "deploy") app_deploy ;;
     "reset") app_reset; app_deploy ;;
      "sync") app_sync ;;
           *) echo "Invalid option"; return 1 ;;
    esac
}
