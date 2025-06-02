const { ApperClient } = window.ApperSDK;

class ProjectService {
  constructor() {
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'project12';
    this.fields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 
      'ModifiedOn', 'ModifiedBy', 'color'
    ];
    this.updateableFields = ['Name', 'Tags', 'Owner', 'color'];
  }

  async fetchProjects(params = {}) {
    try {
      const queryParams = {
        fields: this.fields,
        ...params
      };

      const response = await this.apperClient.fetchRecords(this.tableName, queryParams);
      
      if (!response || !response.data || response.data.length === 0) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  }

  async getProjectById(projectId, params = {}) {
    try {
      const queryParams = {
        fields: this.fields,
        ...params
      };

      const response = await this.apperClient.getRecordById(this.tableName, projectId, queryParams);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching project with ID ${projectId}:`, error);
      throw error;
    }
  }

  async createProject(projectData) {
    try {
      // Filter to only include updateable fields
      const filteredData = {};
      this.updateableFields.forEach(field => {
        if (projectData[field] !== undefined) {
          filteredData[field] = projectData[field];
        }
      });

      const params = {
        records: [filteredData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        if (successfulRecords.length > 0) {
          return successfulRecords[0].data;
        }
      }
      
      throw new Error("Failed to create project");
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }

  async updateProject(projectId, projectData) {
    try {
      // Filter to only include updateable fields plus ID
      const filteredData = { Id: projectId };
      this.updateableFields.forEach(field => {
        if (projectData[field] !== undefined) {
          filteredData[field] = projectData[field];
        }
      });

      const params = {
        records: [filteredData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        if (successfulUpdates.length > 0) {
          return successfulUpdates[0].data;
        }
      }
      
      throw new Error("Failed to update project");
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  }

  async deleteProject(projectId) {
    try {
      const params = {
        RecordIds: [projectId]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  }

  async deleteProjects(projectIds) {
    try {
      const params = {
        RecordIds: projectIds
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        return successfulDeletions.length;
      }
      
      return 0;
    } catch (error) {
      console.error("Error deleting projects:", error);
      throw error;
    }
  }

  async searchProjects(searchTerm, params = {}) {
    try {
      const queryParams = {
        fields: this.fields,
        where: [
          {
            fieldName: "Name",
            operator: "Contains",
            values: [searchTerm]
          }
        ],
        ...params
      };

      return await this.fetchProjects(queryParams);
    } catch (error) {
      console.error("Error searching projects:", error);
      throw error;
    }
  }
}

export default new ProjectService();