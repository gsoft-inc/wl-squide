---
order: 10
---

# Deploy

The deployment process for a federated application can vary depending on various factors, including the chosen hosting provider. Therefore, we do not recommend any specific deployment setup.

However, there are a few essential configurations that need to be made regardless of your deployment choices.

## Default redirect

To enable support for direct page hits, you need to add the following redirect rule to your host application's hosting provider:

```
/* /index.html 200
```
