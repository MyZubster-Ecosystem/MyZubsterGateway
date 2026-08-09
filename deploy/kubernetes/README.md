# Kubernetes deployment

This directory deploys the Gateway, a wallet RPC service, and a blockchain explorer in the `myzubster` namespace.

## Build and publish images

```sh
docker build -t ghcr.io/myzubster-ecosystem/gateway:TAG .
docker build -f Dockerfile.rpc -t ghcr.io/myzubster-ecosystem/monero-rpc:TAG .
docker build -f Dockerfile.explorer -t ghcr.io/myzubster-ecosystem/monero-explorer:TAG .
docker push ghcr.io/myzubster-ecosystem/gateway:TAG
docker push ghcr.io/myzubster-ecosystem/monero-rpc:TAG
docker push ghcr.io/myzubster-ecosystem/monero-explorer:TAG
```

Replace `latest` in the manifests with an immutable image tag before production use.

## Configure and deploy

```sh
kubectl apply -f namespace.yaml
cp secret.template.yaml secret.yaml
# Edit secret.yaml locally with the production MongoDB and RPC credentials.
kubectl apply -f secret.yaml
kubectl apply -k .
```

`secret.yaml` is deliberately not included in `kustomization.yaml` and must remain untracked. Update the Ingress hostname and select a cluster storage class if the default is unsuitable.

## Verify and roll back

```sh
kubectl -n myzubster rollout status deployment/gateway
kubectl -n myzubster get pods,svc,hpa,ingress
kubectl -n myzubster port-forward service/gateway 10000:80
curl http://127.0.0.1:10000/health
kubectl -n myzubster rollout undo deployment/gateway
```
