from pydantic import BaseModel, Field


class PasskeyAttestationRequest(BaseModel):
  attestation: dict = Field()


class PasskeyRenameRequest(BaseModel):
  name: str = Field(
    min_length=1, max_length=128
  )
