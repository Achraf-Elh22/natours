import axios from 'axios';
import { showAlert } from './alerts';

// Type is either "password" or 'data
export const updateSettings = async (data, type) => {
  const url = type === 'password' ? '/api/v1/users/updatePassword' : '/api/v1/users/updateMe';
  try {
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} update successfully!!!`);
      window.setTimeout(location.reload(true), 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
