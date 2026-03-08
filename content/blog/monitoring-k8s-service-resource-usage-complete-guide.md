---
title: "Monitoring K8S Service Resource Usage: A Complete Guide"
summary: "A practical Kubernetes resource monitoring guide using kubectl, Metrics Server, Prometheus/Grafana, alert scripts, and optimization practices."
date: "2025-07-15"
tags: kubernetes,k8s,devops,container
published: true
---
## Overview

Monitoring Kubernetes resource usage is required for reliability, performance, and cost control. This guide covers baseline checks, deeper analysis, and simple automation scripts for daily operations.

## Basic Resource Monitoring

### `kubectl top`

```bash
# Pod usage
kubectl top pods

# Node usage
kubectl top nodes

# Real-time watch
kubectl top pods --watch

# Namespace scope
kubectl top pods -n namespace-name

# Sort by usage
kubectl top pods --sort-by=memory
kubectl top pods --sort-by=cpu
```

### Quotas and Limits

```bash
# Namespace quotas
kubectl get quota -n namespace-name

# Limits in namespace
kubectl get limits -n namespace-name

# Pod requests/limits
kubectl get pods -o custom-columns=NAME:.metadata.name,CPU:.spec.containers[*].resources.requests.cpu,MEM:.spec.containers[*].resources.requests.memory,CPULIMIT:.spec.containers[*].resources.limits.cpu,MEMLIMIT:.spec.containers[*].resources.limits.memory
```

## Advanced Resource Analysis

### Pod-Level Details

```bash
kubectl get pods -o yaml | grep -E "(resources|requests|limits)"
kubectl top pods --containers
```

### Node-Level Details

```bash
kubectl describe nodes

kubectl get nodes -o custom-columns=NAME:.metadata.name,ALLOCATABLECPU:.status.allocatable.cpu,ALLOCATABLEMEM:.status.allocatable.memory,ALLOCATEDCPU:.status.capacity.cpu,ALLOCATEDMEM:.status.capacity.memory

kubectl get nodes -o jsonpath='{.items[*].status.capacity}{"\n"}'
kubectl get nodes -o jsonpath='{.items[*].status.allocatable}{"\n"}'
```

## Metrics Server

### Install and Verify

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

kubectl get deployment -n kube-system metrics-server
kubectl get pods -n kube-system

kubectl top nodes
kubectl top pods
```

### Debug Metrics Server

```bash
kubectl logs -n kube-system deployment/metrics-server
kubectl edit deployment -n kube-system metrics-server
```

## Prometheus and Grafana

### Prometheus Config Example

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    scrape_configs:
      - job_name: kubernetes-pods
        kubernetes_sd_configs:
          - role: pod
```

### Grafana Quick Setup

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm install grafana grafana/grafana
kubectl port-forward svc/grafana 3000:80
```

## Critical Checks

### Hotspot Detection

```bash
kubectl top pods --sort-by=cpu | head -10
kubectl top pods --sort-by=memory | head -10

kubectl get pods --field-selector=status.phase=Pending
```

### Efficiency Review

```bash
kubectl top nodes | awk '
{
  cpu_usage = $3
  cpu_total = $4
  mem_usage = $5
  mem_total = $6
  cpu_util = cpu_usage / cpu_total * 100
  mem_util = mem_usage / mem_total * 100
  printf "Node: %s - CPU: %.1f%% Memory: %.1f%%\n", $1, cpu_util, mem_util
}'
```

## Resource Governance Best Practices

### Requests and Limits Example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
    - name: frontend
      image: nginx
      resources:
        requests:
          memory: "64Mi"
          cpu: "250m"
        limits:
          memory: "128Mi"
          cpu: "500m"
    - name: backend
      image: redis
      resources:
        requests:
          memory: "128Mi"
          cpu: "500m"
        limits:
          memory: "256Mi"
          cpu: "1000m"
```

### HPA Example

```bash
kubectl autoscale deployment my-app --cpu-percent=70 --min=2 --max=10
kubectl get hpa
kubectl describe hpa my-app
```

## Troubleshooting

```bash
# Evicted pods
kubectl get pods --all-namespaces | grep Evicted

# Node pressure indicators
kubectl describe node <node-name> | grep -i pressure

# Scheduling failures
kubectl get events --field-selector=reason=FailedScheduling -A
```

## Automation Scripts

### Daily Report Script

```bash
#!/bin/bash

echo "=== K8S Resource Usage Report ==="
echo "Date: $(date)"
echo ""

echo "=== Node Resource Usage ==="
kubectl top nodes | column -t
echo ""

echo "=== Top CPU Pods ==="
kubectl top pods --sort-by=cpu | head -10
echo ""

echo "=== Top Memory Pods ==="
kubectl top pods --sort-by=memory | head -10
echo ""

echo "=== Pending Pods ==="
kubectl get pods --field-selector=status.phase=Pending
```

### Threshold Alert Script

```bash
#!/bin/bash

NAMESPACES=("production" "staging" "development")
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85

for namespace in "${NAMESPACES[@]}"; do
  echo "Checking namespace: $namespace"

  kubectl top nodes --no-headers | while read -r name cpu mem rest; do
    cpu_usage=$(echo "$cpu" | sed 's/%//')
    mem_usage=$(echo "$mem" | sed 's/%//')

    if (( $(echo "$cpu_usage > $CPU_THRESHOLD" | bc -l) )) || (( $(echo "$mem_usage > $MEMORY_THRESHOLD" | bc -l) )); then
      echo "WARNING: $name CPU=$cpu Memory=$mem"
    fi
  done

done
```

## Closing Notes

Track trends, not just snapshots. The combination of requests/limits governance, metrics collection, and automated reports creates a reliable foundation for proactive cluster operations.
