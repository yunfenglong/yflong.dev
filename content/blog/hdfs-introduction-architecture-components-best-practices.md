---
title: "HDFS Introduction: Architecture, Components, and Best Practices"
summary: "A practical HDFS overview covering architecture, storage model, common commands, configuration, tuning, security, and maintenance." 
date: "2025-04-07"
tags: hadoop,hdfs,big data,distributed systems
published: true
---
## Overview

Hadoop Distributed File System (HDFS) is the primary storage layer used by Hadoop workloads. It is designed for high-throughput data access on commodity hardware and is most effective for write-once, read-many patterns.

HDFS is usually not the right fit for ultra-low-latency random reads.

## Architecture

HDFS follows a master-slave model with three core roles:

- NameNode: manages namespace and metadata.
- DataNode: stores data blocks and serves read/write requests.
- Client: requests metadata from NameNode and streams data with DataNodes.

### NameNode

The NameNode handles:

- File system tree metadata.
- Block mapping and placement.
- Access control and policy checks.

For production, run a high-availability setup to avoid single-point-of-failure risk.

### DataNode

DataNodes handle:

- Block storage.
- Heartbeats to NameNode.
- Block checksum validation.

### Client

Client responsibilities:

- File operations.
- Metadata lookup via NameNode.
- Direct block transfer with DataNodes.

## Data Storage Model

### Block Size

```bash
# Check block size
hdfs dfsadmin -confKey dfs.blocksize

# Common defaults
# Hadoop 1.x: 64MB
# Hadoop 2.x: 128MB
# Hadoop 3.x: 128MB (can be larger)
```

### Replication

```bash
# Check replication factor
hdfs dfsadmin -confKey dfs.replication

# Common default: 3
```

Write path summary:

1. Client streams to the first DataNode.
2. DataNode forwards in pipeline to other replicas.
3. Write is acknowledged when replica writes complete.

## Useful HDFS Commands

### Basic Operations

```bash
# Create directory
hdfs dfs -mkdir /user/hadoop

# Upload file
hdfs dfs -put localfile.txt /user/hadoop/

# Download file
hdfs dfs -get /user/hadoop/remote.txt local.txt

# List files
hdfs dfs -ls /user/hadoop/

# Remove file
hdfs dfs -rm /user/hadoop/oldfile.txt
```

### Administrative Operations

```bash
# Set replication recursively
hdfs dfs -setrep -R 3 /user/hadoop/

# Disk usage
hdfs dfs -du -h /user/hadoop/

# Cluster report
hdfs dfsadmin -report

# Safe mode
hdfs dfsadmin -safemode enter
hdfs dfsadmin -safemode leave
```

## Configuration

### `core-site.xml`

```xml
<configuration>
  <property>
    <name>fs.defaultFS</name>
    <value>hdfs://namenode:8020</value>
  </property>
  <property>
    <name>hadoop.tmp.dir</name>
    <value>/var/hadoop/tmp</value>
  </property>
</configuration>
```

### `hdfs-site.xml`

```xml
<configuration>
  <property>
    <name>dfs.namenode.name.dir</name>
    <value>/var/hadoop/hdfs/namenode</value>
  </property>
  <property>
    <name>dfs.datanode.data.dir</name>
    <value>/var/hadoop/hdfs/datanode</value>
  </property>
  <property>
    <name>dfs.replication</name>
    <value>3</value>
  </property>
  <property>
    <name>dfs.blocksize</name>
    <value>134217728</value>
  </property>
</configuration>
```

## Performance Optimization

### Block Size Strategy

- Large files: prefer larger block sizes.
- Small files: avoid large volumes of tiny files.
- Align block and processing split strategy for batch jobs.

```bash
# Example custom block size on upload
hdfs dfs -D dfs.blocksize=268435456 -put largefile.dat /user/hadoop/
```

### Memory Tuning Example

```xml
<property>
  <name>mapreduce.map.memory.mb</name>
  <value>1536</value>
</property>
<property>
  <name>mapreduce.reduce.memory.mb</name>
  <value>3072</value>
</property>
```

## Security Basics

### Authentication

```bash
hdfs dfs -D hadoop.security.authentication=kerberos -ls /
```

### Permissions and Ownership

```bash
# Set permissions
hdfs dfs -chmod 750 /user/hadoop/protected

# Set ownership
hdfs dfs -chown hadoop:hadoop /user/hadoop/data

# Verify permissions
hdfs dfs -ls -la /user/hadoop/
```

## Monitoring and Maintenance

### Health Checks

```bash
# Cluster health
hdfs dfsadmin -report

# Live DataNodes
hdfs dfsadmin -report -live

# File/block checks
hdfs fsck /user/hadoop -locations -files -blocks
```

### Maintenance Tasks

```bash
# Roll NameNode edits
hdfs dfsadmin -rollEdits

# Refresh DataNodes
hdfs dfsadmin -refreshNodes

# Decommission workflow
echo "datanode3.example.com" > decommissioning-nodes.txt
hdfs dfsadmin -refreshNodes
```

## Common Issues

### NameNode Not Starting

```bash
tail -f /var/hadoop/hdfs/namenode.log
jps | grep NameNode
hdfs dfsadmin -safemode get
```

### DataNode Connection Problems

```bash
hdfs dfsadmin -report -dead
tail -f /var/hadoop/hdfs/datanode.log
rm -rf /var/hadoop/hdfs/datanode/*
hdfs datanode -format
```

### Disk Space Pressure

```bash
hdfs dfsadmin -report
hdfs dfs -du / | sort -nr | head -10
hdfs dfs -expunge
```

## Best Practices

1. Keep large analytical files in HDFS.
2. Avoid too many small files.
3. Use compression where possible.
4. Organize datasets with clear partitioning strategy.
5. Monitor cluster health continuously.
6. Plan DataNode scaling in advance.
7. Back up critical datasets and document restore procedures.
