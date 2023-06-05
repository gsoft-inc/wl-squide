---
order: 10
---

# Deploy

The deployment of a federated application could vary based on many factors, including the choice of the hosting provider. Therefore, we don't recommend any specific deployment setup.

Still, there are a few things that must be configured independently of your deployment choices.

## Default redirect

To support direct page hits, add the following redirect to the host application hosting provider:

```
/* /index.html 200
```
