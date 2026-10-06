export interface UserModel {
  Code?: string;
  code?: string;
  Status?: string;
  status?: string;
  Message?: string;
  message?: string;
  token?: string;
  Token?: string;
  userName?: string;
  UserName?: string;
  username?: string;
  Username?: string;
  displayName?: string;
  DisplayName?: string;
  fullName?: string;
  FullName?: string;
  firstName?: string;
  fullname?: string;
  Fullname?: string;
  FirstName?: string;
  lastName?: string;
  gender?: string | number;
  Gender?: string | number;
  LastName?: string;
  employeeCode?: string;
  EmployeeCode?: string;
  employeeName?: string;
  EmployeeName?: string;
  profilePicture?: string;
  ProfilePicture?: string;
  profilePictureUrl?: string;
  ProfilePictureUrl?: string;
  profilePhoto?: string;
  ProfilePhoto?: string;
  userPhoto?: string;
  UserPhoto?: string;
  avatar?: string;
  Avatar?: string;
  avatarUrl?: string;
  AvatarUrl?: string;
  photo?: string;
  Photo?: string;
  photoUrl?: string;
  PhotoUrl?: string;
  image?: string;
  Image?: string;
  imageUrl?: string;
  ImageUrl?: string;
  pictureUrl?: string;
  PictureUrl?: string;
  [field: string]: unknown;
}

export interface ReturnModel {
  Code?: string;
  code?: string;
  Status?: string;
  status?: string;
  Message?: string;
  message?: string;
  [field: string]: unknown;
}

export type UserProfile = UserModel;
export type LoginResponse = UserModel;
