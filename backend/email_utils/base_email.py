from abc import ABC, abstractmethod

from typing import Iterable


class BaseEmail(ABC):
    """
    Abstract Email class. Used for inheritance.
    """
    @property
    @abstractmethod
    def sender(self):
        pass

    @sender.setter
    @abstractmethod
    def sender(self, sender: str):
        pass

    @property
    @abstractmethod
    def recipients(self):
        pass

    @property
    @abstractmethod
    def to(self):
        pass

    @to.setter
    @abstractmethod
    def to(self, to: 'Iterable[str]'):
        pass

    @property
    @abstractmethod
    def subject(self):
        pass

    @subject.setter
    @abstractmethod
    def subject(self, subject: str):
        pass

    @property
    @abstractmethod
    def cc(self):
        pass

    @cc.setter
    @abstractmethod
    def cc(self, cc: 'Iterable[str]'):
        pass

    @property
    @abstractmethod
    def html_content(self):
        pass

    @html_content.setter
    @abstractmethod
    def html_content(self, content: str):
        pass

    @property
    @abstractmethod
    def files(self):
        pass

    @files.setter
    @abstractmethod
    def files(self, files: 'Iterable[str]'):
        pass

    @abstractmethod
    def as_string(self):
        pass
