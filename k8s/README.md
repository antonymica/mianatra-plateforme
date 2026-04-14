# Kubernetes - Mianatra Plateforme

Les manifestes sont organises par composant pour rester lisibles :

```txt
k8s/
  kustomization.yaml
  namespace.yaml
  common/
    configmap.yaml
    secret.yaml
  postgres/
    service.yaml
    statefulset.yaml
  backend/
    deployment.yaml
    service.yaml
    uploads-pvc.yaml
    hpa.yaml
  frontend/
    deployment.yaml
    service.yaml
    hpa.yaml
  ingress/
    ingress.yaml
```

`kustomization.yaml` est le point d'entree. Il applique le namespace `mianatra-plateforme` aux ressources et garde l'ordre de deploiement clair.

## Construction et publication des images Docker Hub

Connectez-vous d'abord a Docker Hub :

```bash
docker login
```

Construisez et publiez l'image backend :

```bash
docker build -t aanton0/mianatra-plateforme-backend:latest ./backend
docker push aanton0/mianatra-plateforme-backend:latest
```

Construisez et publiez l'image frontend :

```bash
docker build -t aanton0/mianatra-plateforme-frontend:latest ./frontend
docker push aanton0/mianatra-plateforme-frontend:latest
```

## Deploiement Kubernetes

Appliquez tous les manifestes avec Kustomize :

```bash
kubectl apply -k k8s/
```

Suivez le demarrage :

```bash
kubectl get pods -n mianatra-plateforme -w
kubectl get svc,ingress,hpa -n mianatra-plateforme
```

L'application est exposee par l'Ingress. Recuperez l'adresse exposee :

```bash
kubectl get ingress -n mianatra-plateforme
```

Puis ouvrez l'adresse indiquee. Sur Docker Desktop ou certains clusters locaux, ce sera souvent :

```txt
http://localhost
```

## Notes importantes

- L'Ingress utilise `ingressClassName: nginx`; installez ou activez un controleur Ingress NGINX si votre cluster n'en a pas.
- Le HPA a besoin de Metrics Server pour lire la consommation CPU.
- La configuration non sensible est dans `common/configmap.yaml`.
- Les valeurs sensibles sont dans `common/secret.yaml` pour garder les manifestes fonctionnels en test. En production, remplacez-les par un Secret cree hors Git, Sealed Secrets ou External Secrets.
- Changez `SECRET_KEY`, `POSTGRES_PASSWORD` et `DEFAULT_ADMIN_PASSWORD` avant un usage reel.
- Le PVC `backend/uploads-pvc.yaml` utilise `ReadWriteOnce`. Pour scaler le backend sur plusieurs noeuds tout en partageant les PDFs uploades, utilisez une classe de stockage compatible `ReadWriteMany`.
