export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static async showNotification(
    title: string, 
    options?: NotificationOptions & { data?: { url?: string } }
  ): Promise<Notification | null> {
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) {
      console.log('Notification permission denied');
      return null;
    }

    const notification = new Notification(title, {
      icon: '/logo.png',
      badge: '/logo.png',
      ...options,
    });

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      if (options?.data?.url) {
        window.location.href = options.data.url;
      }
      notification.close();
    };

    return notification;
  }

  static async notifyQuotationReady(
    requirementName: string, 
    requirementId: string
  ): Promise<void> {
    await this.showNotification('Quotations Ready! 🎉', {
      body: `Your quotations for "${requirementName}" are ready to review.`,
      tag: `quotation-ready-${requirementId}`,
      requireInteraction: true,
      data: {
        url: `/dashboard?requirement=${requirementId}`,
      },
    });
  }

  static async notifyStatusUpdate(
    message: string, 
    requirementId: string
  ): Promise<void> {
    await this.showNotification('Status Update', {
      body: message,
      tag: `status-update-${requirementId}`,
      data: {
        url: `/dashboard?requirement=${requirementId}`,
      },
    });
  }

  static async notifyNewQuotation(
    supplierName: string,
    requirementId: string
  ): Promise<void> {
    await this.showNotification('New Quotation Received 📬', {
      body: `${supplierName} has submitted a quotation for your requirement.`,
      tag: `new-quotation-${requirementId}`,
      data: {
        url: `/dashboard?requirement=${requirementId}`,
      },
    });
  }

  static async notifyModificationResponse(
    status: 'approved' | 'rejected',
    requirementId: string
  ): Promise<void> {
    const emoji = status === 'approved' ? '✅' : '❌';
    const message = status === 'approved' 
      ? 'Your modification request has been approved!' 
      : 'Your modification request could not be accommodated.';
    
    await this.showNotification(`Modification ${status === 'approved' ? 'Approved' : 'Update'} ${emoji}`, {
      body: message,
      tag: `modification-${requirementId}`,
      data: {
        url: `/dashboard?requirement=${requirementId}`,
      },
    });
  }
}
