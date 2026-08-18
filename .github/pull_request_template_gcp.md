---
name: Google Cloud Deployment
about: Pull request for deploying changes to Google Cloud Platform
title: '[GCP Deploy] '
labels: gcp, deployment
assignees: ''
---

## 🚀 Google Cloud Deployment PR

### Deployment Type
- [ ] Bug Fix
- [ ] Feature Addition
- [ ] Security Update
- [ ] Performance Improvement
- [ ] Infrastructure Update
- [ ] Documentation Update

### Target Environment
- [ ] Development (GCE Dev Instance)
- [ ] Staging (GCE Staging Instance)
- [ ] Production (GCE Production Instance)

### Deployment Checklist

#### Pre-Deployment
- [ ] Code reviewed and approved
- [ ] All tests passing locally
- [ ] Environment variables configured
- [ ] Backup of current deployment created
- [ ] Rollback plan documented

#### Deployment Steps
- [ ] Pull latest changes on GCE instance
- [ ] Install/update dependencies
- [ ] Compile contracts (if applicable)
- [ ] Run database migrations (if applicable)
- [ ] Restart services with PM2
- [ ] Verify services are running
- [ ] Run health checks

#### Post-Deployment
- [ ] Verify deployment on target environment
- [ ] Test critical functionality
- [ ] Monitor logs for errors
- [ ] Update documentation (if needed)
- [ ] Notify team of deployment

### Changes Summary

**Files Modified:**
- 

**Contracts Deployed/Updated:**
- 

**Configuration Changes:**
- 

**Database Changes:**
- 

### Testing Performed

**Manual Testing:**
- 

**Automated Tests:**
- Test Suite: 
- Result: 

### Deployment Details

**GCE Instance:**
- Instance Name: 
- Zone: 
- External IP: 

**Services Affected:**
- 

**Downtime Expected:**
- [ ] Yes - Duration: 
- [ ] No

### Rollback Plan

**If deployment fails:**
1. 
2. 
3. 

**Rollback Command:**
```bash
git reset --hard <previous-commit-hash>
./deploy.sh
```

### Monitoring

**Logs to Monitor:**
- 

**Metrics to Watch:**
- 

**Alert Thresholds:**
- 

### Additional Notes

- 

### Related Issues

Closes #
Related to #
