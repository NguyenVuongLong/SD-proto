import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  // ---------- Page / skeleton state ----------
  isLoading = true;
  showContent = false;
  selectedTab: any = 'editProfile';
  tabTitle = 'Edit Profile';
  subTitle = 'Set Up Your Personal Information';
  listItemClass =
    'flex items-center mb-3 px-5 py-3 rounded-[6px] bg-transparent text-light dark:text-white/60 font-normal [&.active]:text-primary [&.active]:bg-primary/10 duration-300 gap-[12px] cursor-pointer';

  avatarUrl = 'assets/images/avatars/thumbs.png';
  avatarCoverUrl = 'assets/images/profile-cover.png';

  networkList = [
    { name: 'Facebook', icon: 'facebook', avatarColor: '#4267b1', avatarBg: 'rgba(66, 103, 177, 0.1)', status: true, link: 'https://facebook.com' },
    { name: 'Instagram', icon: 'instagram', avatarColor: '#fff', avatarBg: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%,#d6249f 60%,#285AEB 90%)', status: false, link: 'https://instagram.com' },
    { name: 'Twitter', icon: 'twitter', avatarColor: '#1ca1f2', avatarBg: 'rgba(28, 161, 242, 0.1)', status: true, link: 'https://twitter.com' },
    { name: 'Dribbble', icon: 'dribbble', avatarColor: '#d8487e', avatarBg: 'rgba(216, 72, 126, 0.1)', status: false, link: 'https://dribbble.com' },
    { name: 'Github', icon: 'github', avatarColor: '#323131', avatarBg: 'rgba(50, 49, 49, 0.1)', status: true, link: 'https://github.com' },
    { name: 'Linkedin', icon: 'linkedin', avatarColor: '#0174af', avatarBg: 'rgba(1, 116, 175, 0.1)', status: true, link: 'https://linkedin.com' },
    { name: 'Dropbox', icon: 'dropbox', avatarColor: '#005ef7', avatarBg: 'rgba(0, 94, 247, 0.1)', status: false, link: 'https://dropbox.com' }
  ];

  // ---------- Edit Profile tab ----------
  editProfileForm!: FormGroup;
  listOfOption = [
    { label: 'United Stata', value: '1' },
    { label: 'United Kingdom', value: '2' },
    { label: 'France', value: '3' },
    { label: 'German', value: '4' }
  ];

  // ---------- Account Settings tab ----------
  accountSettingsForm!: FormGroup;

  // ---------- Password Settings tab ----------
  passwordForm!: FormGroup;
  passwordVisible = false;

  // ---------- Social Profiles tab ----------
  // removed

  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadData();

    this.editProfileForm = this.fb.group({
      name: [null, [Validators.required]],
      country: [null, [Validators.required]],
      phoneNumberPrefix: ['+86'],
      phoneNumber: [null, [Validators.required]],
      city: [null, [Validators.required]],
      cmName: [null, [Validators.required]],
      website: [null, [Validators.required]],
      zip: [null, [Validators.required]]
    });

    this.accountSettingsForm = this.fb.group({
      username: [null, [Validators.required]],
      email: [null, [Validators.email, Validators.required]]
    });

    this.passwordForm = this.fb.group({
      password: [null],
      newPassword: [null]
    });

    const storedTab = localStorage.getItem('selectedTab');
    if (storedTab) {
      const tabMap: Record<string, { title: string; subtitle: string }> = {
        editProfile:      { title: 'Edit Profile',       subtitle: 'Set Up Your Personal Information' },
        accountSettings:  { title: 'Account Settings',   subtitle: 'Update your username and manage your account' },
        changePassword:   { title: 'Password Settings',  subtitle: 'Change or reset your account password' }
      };
      const entry = tabMap[storedTab];
      if (entry) {
        this.selectedTab = storedTab;
        this.tabTitle    = entry.title;
        this.subTitle    = entry.subtitle;
      }
    }

    const storedAvatar = localStorage.getItem('avatar');
    if (storedAvatar) {
      this.avatarUrl = storedAvatar;
    }
    const storedAvatarCover = localStorage.getItem('avatarCover');
    if (storedAvatarCover) {
      this.avatarCoverUrl = storedAvatarCover;
    }
  }

  loadData(): void {
    // Simulate an asynchronous data loading operation
    setTimeout(() => {
      this.isLoading = false;
      this.showContent = true;
    }, 500);
  }

  selectTab(tab: string, title: string, subtitle: string): void {
    this.selectedTab = tab;
    this.tabTitle = title;
    this.subTitle = subtitle;
    localStorage.setItem('selectedTab', tab);
  }

  // ----- Edit Profile -----
  submitEditProfileForm(): void {
    if (this.editProfileForm.valid) {
      console.log('submit', this.editProfileForm.value);
    } else {
      this.editProfileForm.markAllAsTouched();
    }
  }

  // ----- Account Settings -----
  submitAccountSettingsForm(): void {
    if (this.accountSettingsForm.valid) {
      console.log('submit', this.accountSettingsForm.value);
    } else {
      this.accountSettingsForm.markAllAsTouched();
    }
  }

  // ----- Password Settings -----
  showConfirm(): void {
    this.modalService.confirm({
      nzTitle: '<i>Do you want to change your password?</i>',
      nzOnOk: () => this.message.success('Password Change Successfully')
    });
  }

  submitPasswordForm(): void {
    for (const i in this.passwordForm.controls) {
      this.passwordForm.controls[i].markAsDirty();
      this.passwordForm.controls[i].updateValueAndValidity();
    }
    this.showConfirm();
  }

  // ----- Avatar / Cover upload -----
  private getBase64(img: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
  }

  handleChange(info: { file: NzUploadFile }): void {
    if (!info.file.originFileObj) return;
    this.getBase64(info.file.originFileObj, (img: string) => {
      this.avatarUrl = img;
      localStorage.setItem('avatar', img);
    });
  }

  handleCoverChange(info: { file: NzUploadFile }): void {
    if (!info.file.originFileObj) return;
    this.getBase64(info.file.originFileObj, (img: string) => {
      this.avatarCoverUrl = img;
      localStorage.setItem('avatarCover', img);
    });
  }
}