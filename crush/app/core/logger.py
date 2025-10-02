import logging
import os
import sys

from app.core.config_store import config

log_level_str = config["log"]["level"]
if log_level_str == "DEBUG":
  log_level = logging.DEBUG
elif log_level_str == "INFO":
  log_level = logging.INFO
elif log_level_str == "WARNING":
  log_level = logging.WARNING
elif log_level_str == "ERROR":
  log_level = logging.ERROR
else:
  log_level = logging.INFO

log_file_path = config["log"]["path"]
config_handler = config["log"]["handler"]

handler = []

if "terminal" in config_handler:
  handler.append(logging.StreamHandler(stream=sys.stdout))
if "file" in config_handler:
  os.makedirs(os.path.dirname(log_file_path), exist_ok=True)
  handler.append(logging.FileHandler(log_file_path, mode="a"))

logging.basicConfig(
  level=log_level,
  format=config["log"]["format"],
  handlers=handler
)

logger = logging.getLogger("crush")
logger.debug("Logger set")
