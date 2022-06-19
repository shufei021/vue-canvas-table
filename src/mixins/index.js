/*
 * @Description:
 * @Author: shufei
 * @Date: 2020-12-07 22:01:08
 * @LastEditTime: 2020-12-07 22:18:55
 * @LastEditors: shufei
 */
export default {
  data() {
    return {
      userInfo: "暂无角色" //用户信息
    };
  },
  computed: {},
  async created() {
    // this.getUserInfo();
  },
  methods: {
    /**
     * 获取用户信息
     */
    getUserInfo() {
      this.api
        .getUserInfo()
        .then(res => {
          this.userInfo = res.data.userInfo;
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
