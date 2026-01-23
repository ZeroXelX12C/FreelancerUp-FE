// Project Feature - Phase 4: Project Discovery

// Services
export { projectService } from './services/projectService';

// Hooks
export {
  useProjects,
  useProjectDetail,
  useClientProjects,
  useCreateProject,
  useUpdateProject,
  useUpdateProjectStatus,
  useDeleteProject,
  useProjectCategories,
} from './hooks/useProjects';

// Components
export {
  ProjectCard,
  ProjectSearchBar,
  ProjectFilters,
  ProjectList,
  ProjectSkeleton,
  ProjectListSkeleton,
  EmptyProjects,
  CreateProjectForm,
} from './components';
