export type Course = {
  id: number;
  title: string;
  description: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  pdf_url: string;
};

export type AdminStats = {
  total_courses: number;
  total_pdf_files: number;
  total_storage_bytes: number;
  latest_course: Course | null;
};

export type CourseFormValues = {
  title: string;
  description: string;
  file?: File | null;
};
