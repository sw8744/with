FROM python:3.12.12-alpine3.22

WORKDIR /home/with

COPY ./app ./app
COPY requirments.txt .
RUN mkdir logs

RUN pip3 install --no-cache-dir --upgrade -r requirments.txt

EXPOSE 42002

ENV mode=prod
ENTRYPOINT ["python3", "-m", "uvicorn", "app.main:app", "--proxy-headers", "--host", "0.0.0.0", "--port", "42002"]
