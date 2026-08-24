#!/usr/bin/env python3
"""Rewrite jscpd's SARIF locations so GitHub can anchor them to a file.

jscpd appends the language it parsed a block as to the path it reports:
`src/components/beat_grid_view.vue:typescript`. No such file exists, so Code
Scanning accepts the alert and then cannot place it on any line of the diff —
the alerts are there, and nobody reviewing a PR ever sees them.

Only a suffix whose removal names a file that actually exists is stripped, and
a location that still cannot be resolved is an error rather than a pass: the
whole failure this fixes was one that stayed green.
"""

import json
import sys
from pathlib import Path

SUFFIX = ":"


def resolved(uri: str, root: Path) -> str | None:
    """`uri` itself if it names a file, else the same with one `:token` removed."""
    if (root / uri).is_file():
        return uri
    head, marker, _tail = uri.rpartition(SUFFIX)
    if not marker or not head:
        return None
    return head if (root / head).is_file() else None


def normalize(report: dict, root: Path) -> tuple[int, list[str]]:
    rewritten = 0
    unresolved: list[str] = []
    for run in report.get("runs", []):
        for result in run.get("results", []):
            for location in result.get("locations", []):
                artifact = location.get("physicalLocation", {}).get("artifactLocation", {})
                uri = artifact.get("uri")
                if uri is None:
                    continue
                fixed = resolved(uri, root)
                if fixed is None:
                    unresolved.append(uri)
                elif fixed != uri:
                    artifact["uri"] = fixed
                    rewritten += 1
    return rewritten, unresolved


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: normalize_jscpd_sarif.py <sarif> <repo-root>", file=sys.stderr)
        return 2
    sarif = Path(sys.argv[1])
    root = Path(sys.argv[2])
    report = json.loads(sarif.read_text(encoding="utf-8"))
    rewritten, unresolved = normalize(report, root)
    if unresolved:
        print(f"cannot resolve {len(unresolved)} SARIF location(s) to a file:", file=sys.stderr)
        for uri in sorted(set(unresolved))[:10]:
            print(f"  {uri}", file=sys.stderr)
        return 1
    sarif.write_text(json.dumps(report), encoding="utf-8")
    print(f"normalized {rewritten} SARIF location(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
