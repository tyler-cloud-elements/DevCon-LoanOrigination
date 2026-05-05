#!/usr/bin/env bash
#
# Build, pack, publish, and deploy a UiPath coded app.
#
# Usage:
#   ./deploy-app.sh <app-path> [version]
#
# Examples:
#   ./deploy-app.sh loan-origination-app-0427
#   ./deploy-app.sh loan-origination-app-0427 1.2.0
#
# When no version is provided, the script reads the current version from
# <app-path>/.uipath/app.config.json and bumps the patch component.

set -euo pipefail

APP_PATH="${1:-}"
VERSION_ARG="${2:-}"

if [[ -z "$APP_PATH" ]]; then
  echo "Usage: $0 <app-path> [version]" >&2
  exit 1
fi

if [[ ! -d "$APP_PATH" ]]; then
  echo "App path not found: $APP_PATH" >&2
  exit 1
fi

if ! command -v uip >/dev/null 2>&1; then
  echo "uip CLI not found in PATH. Install with: npm i -g @uipath/uipathcli" >&2
  exit 1
fi

cd "$APP_PATH"

# Read JSON value — uses jq when present, falls back to a sed extractor for
# the simple shapes we ship in .uipath/app.config.json and package.json.
read_json() {
  local file="$1" key="$2"
  if [[ ! -f "$file" ]]; then return 0; fi
  if command -v jq >/dev/null 2>&1; then
    jq -r --arg k "$key" '.[$k] // empty' "$file"
  else
    sed -n "s/.*\"${key}\"[[:space:]]*:[[:space:]]*\"\\([^\"]*\\)\".*/\\1/p" "$file" | head -1
  fi
}

CONFIG_FILE=".uipath/app.config.json"
APP_NAME=$(read_json "$CONFIG_FILE" "appName")
CURRENT_VERSION=$(read_json "$CONFIG_FILE" "appVersion")

if [[ -z "$APP_NAME" ]]; then
  APP_NAME=$(read_json "package.json" "name")
fi
if [[ -z "$APP_NAME" ]]; then
  echo "Could not determine app name (looked in $CONFIG_FILE and package.json)." >&2
  exit 1
fi

if [[ -n "$VERSION_ARG" ]]; then
  VERSION="$VERSION_ARG"
elif [[ -n "$CURRENT_VERSION" ]]; then
  IFS='.' read -r MAJOR MINOR PATCH <<<"$CURRENT_VERSION"
  if [[ -z "${MAJOR:-}" || -z "${MINOR:-}" || -z "${PATCH:-}" ]]; then
    echo "Could not parse version '$CURRENT_VERSION' from $CONFIG_FILE — pass version explicitly." >&2
    exit 1
  fi
  VERSION="$MAJOR.$MINOR.$((PATCH + 1))"
else
  VERSION="1.0.0"
fi

echo "==> $APP_NAME"
echo "    path:    $APP_PATH"
echo "    version: $VERSION${CURRENT_VERSION:+ (was $CURRENT_VERSION)}"

echo "==> npm run build"
npm run build

echo "==> uip codedapp pack dist -n $APP_NAME -v $VERSION"
uip codedapp pack dist -n "$APP_NAME" -v "$VERSION"

echo "==> uip codedapp publish"
uip codedapp publish

echo "==> uip codedapp deploy"
uip codedapp deploy

echo "==> Done. $APP_NAME v$VERSION deployed."
