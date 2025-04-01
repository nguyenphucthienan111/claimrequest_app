import React, { useCallback, useEffect, useState } from 'react'
import Layout from '../../../shared/layouts/Layout'
import './ProfilePage.css'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { useForm } from 'react-hook-form';
import { Avatar as MUIAvatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText, Switch, Slider, CircularProgress, Backdrop } from '@mui/material';
import { updateInfo, updatePassword } from '../services/userApi';
import toast from 'react-hot-toast';
import InfiniteScroll from "react-infinite-scroll-component";
import Skeleton from 'react-loading-skeleton';
import "react-loading-skeleton/dist/skeleton.css";
import { searchProjectWithData } from '../../admin/services/projectService';
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import { getEmployeeById, updateEmployee } from '../../admin/services/userService';
import { Employee, EmployeeData } from '../../admin/types/user';

type FormData = {
  username?: string;
  email?: string;
  oldPassword?: string;
  newPassword?: string;
};

type EmployeeFormData = {
  phone_number: string;
  account: string;
  address: string;
};

interface ProjectData {
  _id: string,
  project_name: string,
  project_code: string,
  project_department: string,
  project_description: string,
  project_status: string,
  project_start_date: string,
  project_end_date: string,
  updated_by: string,
  is_deleted: boolean,
  created_at: string,
  updated_at: string,
  project_comment: string | null,
  project_members: {
    project_code: string,
    user_id: string,
    employee_id: string,
    user_name: string,
    full_name: string,
  }[];
}

const ProfilePage: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("userData") || "{}");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updateAvatarLoading, setUpdateAvatarLoading] = useState(false);
  const [updateEmployeeLoading, setUploadEmployeeLoading] = useState(false);
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [myProjects, setMyProjects] = useState<ProjectData[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    user_id: "",
    job_rank: "",
    contract_type: "",
    account: "",
    address: "",
    phone: "",
    full_name: "",
    avatar_url: "",
    department_code: "",
    salary: 0,
    end_date: new Date(),
    start_date: new Date(),
  });

  // Form USER
  const {
    register: registerUser,
    handleSubmit: handleSubmitUser,
    formState: { errors: errorsUser },
    reset,
  } = useForm<FormData>();

  // Form EMPLOYEE
  const {
    register: registerEmployee,
    handleSubmit: handleSubmitEmployee,
    formState: { errors: errorsEmployee },
  } = useForm<EmployeeFormData>();

  // Switch update
  const handleSwitchChange = () => {
    setIsPasswordMode((prev) => !prev);
    reset();
  };

  // Chuyển đổi ngày giờ
  const formatDateToUTC7 = (date?: Date | string | null): string => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  // Hàm cắt ảnh
  const getCroppedImg = (imageSrc: string, cropArea: any) => {
    return new Promise<string>((resolve) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        canvas.width = cropArea.width;
        canvas.height = cropArea.height;

        ctx.drawImage(
          image,
          cropArea.x, cropArea.y, cropArea.width, cropArea.height,
          0, 0, canvas.width, canvas.height
        );

        resolve(canvas.toDataURL("image/jpeg"));
      };
    });
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "UPLOAD_AVATAR"); // Thay bằng upload_preset
    formData.append("cloud_name", "drkz4qdfq"); // Thay bằng cloud_name

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/drkz4qdfq/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      return data.secure_url; // Trả về URL ảnh sau khi upload
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
  });

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveAvatar = async () => {
    if (updateAvatarLoading) return;
    setUpdateAvatarLoading(true);

    if (imageSrc && croppedAreaPixels) {
      const croppedImg = await getCroppedImg(imageSrc, croppedAreaPixels);
      const res = await fetch(croppedImg);
      const blob = await res.blob();
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

      const uploadedImageUrl = await uploadToCloudinary(file);
      if (!uploadedImageUrl) {
        toast.error("Upload failed!");
        return;
      }

      const updatedData = { ...employeeData, avatar_url: uploadedImageUrl };
      try {
        await updateEmployee(user._id, updatedData);
        setEmployeeData(updatedData);
        toast("Upload avatar successfully.", {
          icon: "✅",
        });
      } catch (error: any) {
        toast(error.toString(), {
          icon: "❌",
        });
      } finally {
        setOpenDialog(false);
        setImageSrc("");
        setUpdateAvatarLoading(false);
      }
    }
  };

  const onSubmitEmployeeData = async (data: EmployeeFormData) => {
    if (updateEmployeeLoading) return;
    setUploadEmployeeLoading(true);

    console.log("Submit Employee data: ", data);
    const updatedData = {
      ...employeeData,
      phone: data.phone_number,
      address: data.address,
      account: data.account,
    }
    try {
      await updateEmployee(user._id, updatedData);
      setEmployeeData(updatedData);
      toast("Update info successfully.", {
        icon: "✅",
      });
    } catch (error: any) {
      toast(error.toString(), {
        icon: "❌",
      });
    } finally {
      setUploadEmployeeLoading(false);
    }
  }

  const onSubmit = async (data: FormData) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (isPasswordMode) {
        await updatePassword({
          old_password: data.oldPassword || '',
          new_password: data.newPassword || '',
        });
      } else {
        await updateInfo(user?._id, {
          email: data.email || '',
          user_name: data.username || ''
        });
      }
      toast("Update successfully.", {
        icon: "✅",
      });
      reset();
    } catch (error: any) {
      toast(error.toString(), {
        icon: "❌",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployee = async () => {
    const response = await getEmployeeById(user._id);
    if (response) {
      setEmployee(response);
    }
  }

  const fetchProject = async () => {
    if (!hasMore) return;
    const projectData = {
      searchTerm: "",
      startDate: "",
      endDate: "",
      department: "",
      user_id: user._id,
    }
    try {
      const response = await searchProjectWithData(projectData, pageNum);
      setMyProjects([...myProjects, ...response.pageData]);
      if (response.pageInfo?.totalPages > pageNum) {
        setPageNum(prevPageNum => prevPageNum + 1);
      } else {
        setHasMore(false);
      }
    } catch (error: any) {
      toast(error.toString(), {
        icon: "❌",
      });
    }
  }

  useEffect(() => {
    if (employee) {
      setEmployeeData({
        user_id: employee.user_id,
        job_rank: employee.job_rank,
        contract_type: employee.contract_type,
        account: employee?.account || "",
        address: employee.address,
        phone: employee.phone,
        full_name: employee.full_name,
        avatar_url: employee.avatar_url,
        department_code: employee.department_code,
        salary: employee.salary,
        end_date: employee.end_date,
        start_date: employee.start_date,
      });
    }
  }, [employee])

  useEffect(() => {
    fetchEmployee();
  }, [])

  useEffect(() => {
    fetchProject();
  }, [])

  return (
    <Layout>
      <div className='profile-page-container'>
        <div className='profile-page-title'>
          <h2>My profile info</h2>
          <small>Welcome to FPT claim portal</small>
        </div>
        <div className='profile-page-content'>
          <div className='profile-page-board'>
            <div className='profile-left-panel'>
              {employee ? (
                <>
                  <MUIAvatar
                    alt="Remy Sharp"
                    className='profile-avatar'
                    src={employee.avatar_url || "https://via.placeholder.com/150"}
                    onClick={() => setOpenDialog(true)}
                  />
                  <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
                    <DialogTitle
                      sx={{ textAlign: "center", fontWeight: "bold" }}
                    >
                      Update your avatar
                    </DialogTitle>
                    <DialogContent>
                      {!imageSrc ? (
                        <div {...getRootProps()} style={{
                          border: "2px dashed #ccc",
                          borderRadius: "10px",
                          padding: "20px",
                          textAlign: "center",
                          cursor: "pointer",
                        }}>
                          <input {...getInputProps()} />
                          <p>Drag & drop images here or click to select images</p>
                        </div>
                      ) : (
                        <>
                          <div style={{ position: "relative", width: "100%", height: 400 }}>
                            <Cropper
                              image={imageSrc}
                              crop={crop}
                              zoom={zoom}
                              aspect={1}
                              onCropChange={setCrop}
                              onZoomChange={setZoom}
                              onCropComplete={onCropComplete}
                            />
                          </div>
                          <Slider
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={(_, newZoom) => setZoom(newZoom as number)}
                            aria-labelledby="zoom-slider"
                          />
                        </>
                      )}
                    </DialogContent>
                    <DialogActions>
                      <div className='flex justify-center gap-4 w-full'>
                        <button
                          className='px-4 py-2 text-white bg-[#DC2625] border border-[#DC2625] rounded-md cursor-pointer text-md font-semibold transition-all duration-300 ease-in-out transform hover:bg-transparent hover:text-[#DC2625] hover:scale-105'
                          onClick={() => {
                            setImageSrc("");
                            setOpenDialog(false)
                          }}>
                          Cancel
                        </button>
                        {imageSrc && (
                          <button
                            className='px-4 py-2 text-white bg-[#1976D2] border border-[#1976D2] rounded-md cursor-pointer text-md font-semibold transition-all duration-300 ease-in-out transform hover:bg-transparent hover:text-[#1976D2] hover:scale-105'
                            onClick={handleSaveAvatar}>
                            Cut & Save
                          </button>
                        )}
                      </div>
                    </DialogActions>
                    <Backdrop sx={{ color: "#fff", zIndex: 1301 }} open={updateAvatarLoading}>
                      <CircularProgress color="inherit" />
                    </Backdrop>
                  </Dialog>
                  <div className='profile-bio'>
                    <h3>{employee.full_name}</h3>
                    <p>{employee.job_rank}</p>
                  </div>
                  <form
                    onSubmit={handleSubmitUser(onSubmit)} className='update-form'>
                    {!isPasswordMode ? (
                      <>
                        <input
                          defaultValue={user?.user_name}
                          {...registerUser('username', { required: 'Username is required' })}
                          placeholder="Enter username"
                        />
                        {errorsUser.username && <p style={{ color: 'red' }}>{errorsUser.username.message}</p>}

                        <input
                          type="email"
                          defaultValue={user?.email}
                          {...registerUser('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                              message: 'Invalid email format',
                            },
                          })}
                          placeholder="Enter email"
                        />
                        {errorsUser.email && <p style={{ color: 'red' }}>{errorsUser.email.message}</p>}
                        <div className='activate-info'>
                          <p>Is activate</p>
                          {user?.is_blocked ? (
                            <div
                              style={{
                                backgroundColor: "#ff002b",
                                boxShadow: "0 0 30px #ff002b, 0 0 60px #ff002b"
                              }}
                            >
                            </div>
                          ) : (
                            <div
                              style={{
                                backgroundColor: "#00ffcc",
                                boxShadow: "0 0 30px #00ffcc, 0 0 60px #00ffcc",
                              }}
                            >
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <input
                          type="password"
                          {...registerUser('oldPassword', { required: 'Old password is required' })}
                          placeholder="Enter old password"
                        />
                        {errorsUser.oldPassword && <p style={{ color: 'red' }}>{errorsUser.oldPassword.message}</p>}

                        <input
                          type="password"
                          {...registerUser('newPassword', { required: 'New password is required' })}
                          placeholder="Enter new password"
                        />
                        {errorsUser.newPassword && <p style={{ color: 'red' }}>{errorsUser.newPassword.message}</p>}
                        <div className='activate-info'>
                          <p>Is activate</p>
                          {user?.is_blocked ? (
                            <div
                              style={{
                                backgroundColor: "#ff002b",
                                boxShadow: "0 0 30px #ff002b, 0 0 60px #ff002b"
                              }}
                            >
                            </div>
                          ) : (
                            <div
                              style={{
                                backgroundColor: "#00ffcc",
                                boxShadow: "0 0 30px #00ffcc, 0 0 60px #00ffcc",
                              }}
                            >
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    <button type="submit">
                      {isLoading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> :
                        (isPasswordMode ? "Update Password" : "Update Profile")
                      }
                    </button>
                  </form>
                  <div className="switch-container">
                    <span>Update Profile</span>
                    <Switch
                      checked={isPasswordMode}
                      onChange={handleSwitchChange}
                      color="secondary"
                    />
                    <span>Update Password</span>
                  </div>
                </>
              ) : (
                <div className='left-panel-loading'>
                  <Skeleton circle width={250} height={250} style={{ margin: "20px 0" }} />
                  <Skeleton height={45} width={525} />
                  <Skeleton height={145} width={525} style={{ margin: "40px 0 10px" }} />
                  <Skeleton height={44} width={196} style={{ marginBottom: "20px" }} />
                  <Skeleton height={38} width={310} />
                </div>
              )}
            </div>
            <div className='profile-right-top-panel'>
              <div className='profile-information-title'>
                {employee ? (
                  <>
                    <h3>Profile Information</h3>
                    <CalendarMonthOutlinedIcon />
                  </>
                ) : (
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}>
                    <Skeleton height={20} width={175} />
                    <Skeleton height={20} width={20} />
                  </div>
                )}
              </div>
              <div className='profile-information-content'>
                {employee ? (
                  <form className='profile-information' onSubmit={handleSubmitEmployee(onSubmitEmployeeData)}>
                    <div style={{ display: "flex", gap: "30px" }}>
                      <div style={{ width: "50%" }}>
                        <label>Phone number:</label>
                        <input
                          {...registerEmployee("phone_number", {
                            required: "Phone number is required",
                            pattern: {
                              value: /^[0-9]+$/,
                              message: "Phone number must contain only digits",
                            },
                            minLength: {
                              value: 10,
                              message: "Phone number must be at least 10 digits",
                            },
                            maxLength: {
                              value: 11,
                              message: "Phone number must be at most 11 digits",
                            },
                          })}
                          defaultValue={employee.phone || ''}
                          style={{ width: "100%" }}
                        />
                        {errorsEmployee.phone_number && <p style={{ color: "red", fontSize: "12px" }}>{errorsEmployee.phone_number.message}</p>}
                      </div>
                      <div style={{ width: "50%" }}>
                        <label>Account:</label>
                        <input
                          {...registerEmployee("account", { required: "Account is required" })}
                          defaultValue={employee.account || ''}
                          style={{ width: "100%" }}
                        />
                        {errorsEmployee.account && <p style={{ color: "red", fontSize: "12px" }}>{errorsEmployee.account.message}</p>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "30px" }}>
                      <div style={{ width: "50%" }}>
                        <label>Start date:</label>
                        <input
                          value={formatDateToUTC7(employee.start_date) || ''}
                          readOnly
                          style={{ width: "100%" }}
                        />
                      </div>
                      <div style={{ width: "50%" }}>
                        <label>End date:</label>
                        <input
                          value={formatDateToUTC7(employee.end_date) || ''}
                          readOnly
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "30px" }}>
                      <div style={{ width: "50%" }}>
                        <label>Address:</label>
                        <input
                          {...registerEmployee("address", { required: "Address is required" })}
                          defaultValue={employee.address || ''}
                          style={{ width: "100%" }}
                        />
                        {errorsEmployee.address && <p style={{ color: "red", fontSize: "12px" }}>{errorsEmployee.address.message}</p>}
                      </div>
                      <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "50%",
                      }}>
                        <button type='submit'>
                          {updateEmployeeLoading ? <CircularProgress size={24} /> : "Update Info"}
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px"
                  }}>
                    <div style={{ display: "flex", gap: "30px" }}>
                      <Skeleton height={60} width={270} />
                      <Skeleton height={60} width={270} />
                    </div>
                    <div style={{ display: "flex", gap: "30px" }}>
                      <Skeleton height={60} width={270} />
                      <Skeleton height={60} width={270} />
                    </div>
                    <div style={{ display: "flex", gap: "30px" }}>
                      <Skeleton height={60} width={270} />
                      <Skeleton height={60} width={270} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className='profile-right-bottom-panel'>
              <div className='my-projects-title'>
                {employee ? (
                  <>
                    <h3>My involved projects</h3>
                    <button type='button'>Filter by</button>
                  </>
                ) : (
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}>
                    <Skeleton height={20} width={190} />
                    <Skeleton height={30} width={100} />
                  </div>
                )}
              </div>
              <div id='projectsScrollDiv' className='my-projects-list'>
                <InfiniteScroll
                  dataLength={myProjects.length}
                  next={fetchProject}
                  hasMore={hasMore}
                  loader={
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      rowGap: "20px",
                      width: "100%",
                    }}>
                      <Skeleton height={40} width="100%" />
                      <Skeleton height={40} width="100%" />
                      <Skeleton height={40} width="100%" />
                      <Skeleton height={40} width="100%" />
                    </div>
                  }
                  endMessage={
                    <p style={{ textAlign: "center", marginTop: 10 }}>
                      Đã hiển thị tất cả project
                    </p>
                  }
                  scrollableTarget="projectsScrollDiv"
                >
                  <List>
                    {myProjects.map((project: ProjectData, index: number) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={project.project_name}
                          secondary={`Code: ${project.project_code}`}
                        />
                        <Button className='view-project-btn'>View detail</Button>
                      </ListItem>
                    ))}
                  </List>
                </InfiniteScroll>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout >
  )
}

export default ProfilePage