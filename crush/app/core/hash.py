import hashlib


def sha256(msg: str) -> str:
  encoded = msg.encode()

  s256 = hashlib.sha256()
  s256.update(encoded)

  return s256.hexdigest()


def sha256_bytes(msg: bytes) -> str:
  s256 = hashlib.sha256()
  s256.update(msg)

  return s256.hexdigest()

def md5(msg: str) -> str:
  encoded = msg.encode()

  m5 = hashlib.md5()
  m5.update(encoded)

  return m5.hexdigest()
