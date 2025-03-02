from redis import Redis
from rq import Queue, Worker
from model import *
from db import DataRepository, cfg, make_req

conn = Redis()

q = Queue(connection=conn)

# pgclient = DataRepository(
#     host="185.170.153.129",
#     port="5432",
#     user="tender",
#     password="tenderpass",
#     db="tenderdb"
# )

# cfg = {
#     "host":"185.170.153.129",
#     "port":"5432",
#     "user":"tender",
#     "password":"tenderpass",
#     "db":"tenderdb"
# }

# def make_req(cfg, method, params):
#     pgclient = DataRepository(**cfg)
#     method(pgclient, params)

q.enqueue(make_req, cfg, DataRepository.get_category_high_demand, CategoryHighDemandRequest(
    Interval=Interval(
        months=10,
    )
))

print(q.get_jobs())


