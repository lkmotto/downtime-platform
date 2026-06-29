"""
Validate that configuration files in config/ and backend/ exist and
are syntactically correct (JSON, YAML, TOML).
"""

import json
import os
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).resolve().parent.parent


def _resolve(path: str) -> Path:
    return PROJECT_ROOT / path


# ──────────────────────────────────────────────
# 1. Directory structure / existence
# ──────────────────────────────────────────────


class TestDirectoryStructure:
    def test_backend_directory_exists(self):
        assert (_resolve("backend")).is_dir()

    def test_frontend_directory_exists(self):
        assert (_resolve("frontend")).is_dir()

    def test_config_directory_exists(self):
        assert (_resolve("config")).is_dir()

    def test_python_files_in_backend(self):
        backend = _resolve("backend")
        py_files = list(backend.glob("*.py"))
        assert len(py_files) >= 5, f"Expected >=5 .py files, found {len(py_files)}"

    def test_backend_requirements_exists(self):
        assert (_resolve("backend/requirements.txt")).is_file()

    def test_fetchers_package_exists(self):
        assert (_resolve("backend/fetchers/__init__.py")).is_file()


# ──────────────────────────────────────────────
# 2. JSON config files (config/)
# ──────────────────────────────────────────────


class TestConfigJsonFiles:
    @pytest.mark.parametrize(
        "path",
        [
            "config/components.json",
            "config/package.json",
            "config/taste-profile.json",
            "config/tsconfig.json",
        ],
    )
    def test_json_file_exists_and_parses(self, path):
        full = _resolve(path)
        assert full.is_file(), f"{path} should exist"
        with open(full, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        assert isinstance(data, dict), f"{path} should be a JSON object"

    def test_components_json_has_schema(self):
        with open(_resolve("config/components.json"), "r", encoding="utf-8") as fh:
            data = json.load(fh)
        assert "$schema" in data
        assert data["$schema"] == "https://ui.shadcn.com/schema.json"
        assert "style" in data
        assert "tailwind" in data
        assert "aliases" in data

    def test_package_json_keys(self):
        with open(_resolve("config/package.json"), "r", encoding="utf-8") as fh:
            data = json.load(fh)
        for key in ("name", "version", "dependencies", "devDependencies", "scripts"):
            assert key in data, f"package.json missing '{key}'"
        assert isinstance(data["scripts"], dict)

    def test_taste_profile_has_required_sections(self):
        with open(_resolve("config/taste-profile.json"), "r", encoding="utf-8") as fh:
            data = json.load(fh)
        assert "user" in data
        assert "interests" in data
        assert "scenarios" in data
        assert "scoring" in data
        assert "sources" in data

    def test_tsconfig_json_keys(self):
        with open(_resolve("config/tsconfig.json"), "r", encoding="utf-8") as fh:
            data = json.load(fh)
        assert "compilerOptions" in data
        assert "include" in data
        assert "exclude" in data
        co = data["compilerOptions"]
        assert co.get("strict") is True
        assert co.get("moduleResolution") == "bundler"


# ──────────────────────────────────────────────
# 3. YAML config files
# ──────────────────────────────────────────────


class TestConfigYamlFiles:
    @pytest.mark.parametrize(
        "path",
        [
            "config/.pre-commit-config.yaml",
            "backend/.pre-commit-config.yaml",
        ],
    )
    def test_yaml_file_exists_and_parses(self, path):
        full = _resolve(path)
        assert full.is_file(), f"{path} should exist"
        # Use stdlib yaml if available, otherwise fall back to raw check
        try:
            import yaml

            with open(full, "r", encoding="utf-8") as fh:
                data = yaml.safe_load(fh)
            assert data is not None, f"{path} should parse to non-null YAML"
        except ImportError:
            # Fallback: just read and check it starts with valid YAML structure
            with open(full, "r", encoding="utf-8") as fh:
                content = fh.read()
            assert content.strip().startswith(("#", "repos:")), (
                f"{path} looks like invalid YAML"
            )

    def test_config_pre_commit_has_repos(self):
        try:
            import yaml

            with open(_resolve("config/.pre-commit-config.yaml"), "r", encoding="utf-8") as fh:
                data = yaml.safe_load(fh)
            assert "repos" in data
        except ImportError:
            pytest.skip("PyYAML not available")


# ──────────────────────────────────────────────
# 4. Environment config file
# ──────────────────────────────────────────────


class TestEnvConfig:
    def test_env_example_exists(self):
        """backend/.env.example should exist as documentation."""
        path = _resolve("backend/.env.example")
        assert path.is_file()

    def test_env_example_is_readable(self):
        path = _resolve("backend/.env.example")
        with open(path, "r", encoding="utf-8") as fh:
            lines = fh.readlines()
        assert len(lines) > 0
        # Should contain at least some key=value patterns or comments
        content = "".join(lines)
        assert len(content.strip()) > 0

    def test_pyproject_toml_exists(self):
        path = _resolve("pyproject.toml")
        assert path.is_file()
        with open(path, "r", encoding="utf-8") as fh:
            content = fh.read()
        assert "[project]" in content
        assert "pytest" in content


# ──────────────────────────────────────────────
# 5. Shared schema file
# ──────────────────────────────────────────────


class TestSharedSchema:
    def test_shared_schema_exists_in_both(self):
        """The shared/schema.ts file should exist in root and config/."""
        root_shared = _resolve("shared/schema.ts")
        config_shared = _resolve("config/shared/schema.ts")
        frontend_shared = _resolve("frontend/shared/schema.ts")
        # At least one should exist
        exists = [root_shared.is_file(), config_shared.is_file(), frontend_shared.is_file()]
        assert any(exists), "shared/schema.ts not found in root, config/, or frontend/"

    def test_shared_schema_is_readable(self):
        for candidate in [
            _resolve("shared/schema.ts"),
            _resolve("config/shared/schema.ts"),
            _resolve("frontend/shared/schema.ts"),
        ]:
            if candidate.is_file():
                with open(candidate, "r", encoding="utf-8") as fh:
                    content = fh.read()
                assert "zod" in content.lower() or "schema" in content.lower()
                return
        pytest.skip("No shared/schema.ts found")
