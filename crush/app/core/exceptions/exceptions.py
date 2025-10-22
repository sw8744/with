import logging

log = logging.getLogger(__name__)


class ItemNotFoundError(Exception):
  def __init__(self):
    super()
