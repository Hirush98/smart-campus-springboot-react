package com.smartcampus.service;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Module A - Facilities & Assets Catalogue
 * Implemented by: Member 1
 */
@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    public List<Resource> searchResources(ResourceType type, ResourceStatus status,
                                           String location, Integer minCapacity) {
        if (type != null && status != null) {
            return resourceRepository.findByTypeAndStatus(type, status);
        }
        if (type != null) {
            return resourceRepository.findByType(type);
        }
        if (status != null) {
            return resourceRepository.findByStatus(status);
        }
        if (location != null && !location.isBlank()) {
            return resourceRepository.findByLocationContainingIgnoreCase(location);
        }
        if (minCapacity != null) {
            return resourceRepository.findByCapacityGreaterThanEqual(minCapacity);
        }
        return resourceRepository.findAll();
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource updated) {
        Resource existing = getResourceById(id);
        existing.setName(updated.getName());
        existing.setType(updated.getType());
        existing.setLocation(updated.getLocation());
        existing.setBuilding(updated.getBuilding());
        existing.setFloor(updated.getFloor());
        existing.setCapacity(updated.getCapacity());
        existing.setDescription(updated.getDescription());
        existing.setAvailabilityWindows(updated.getAvailabilityWindows());
        existing.setStatus(updated.getStatus());
        existing.setSerialNumber(updated.getSerialNumber());
        existing.setManufacturer(updated.getManufacturer());
        return resourceRepository.save(existing);
    }

    public Resource updateResourceStatus(String id, ResourceStatus status) {
        Resource resource = getResourceById(id);
        resource.setStatus(status);
        return resourceRepository.save(resource);
    }

    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }
}
